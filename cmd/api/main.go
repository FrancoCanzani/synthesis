package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"synthesis/internal/database"
	"synthesis/internal/server"

	"github.com/robfig/cron/v3"
)

func gracefulShutdown(apiServer *http.Server, db database.Service, c *cron.Cron, done chan bool) {
        ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
        defer stop()

        <-ctx.Done()

        log.Println("Shutting down gracefully, press Ctrl+C again to force")

        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        if err := apiServer.Shutdown(ctx); err != nil {
                log.Printf("Server forced to shutdown with error: %v", err)
        }

        log.Println("Server exiting")

        if err := db.Close(); err != nil { // Close DB connection
                log.Printf("Error closing database: %v", err)
        }

        c.Stop() // Stop the cron job scheduler

        done <- true
}

func main() {
	db := database.New()
	defer db.Close()

	server := server.NewServer()

	c := cron.New()
	_, err := c.AddFunc("*/10 * * * *", func() { // Run every 10 minutes
			err := db.UpdateAllFeeds(context.Background())
			if err != nil {
					log.Printf("Error updating feeds: %v", err) 
			}
	})

	if err != nil {
			log.Printf("Error scheduling cron job: %v", err) 
			//  logging/monitoring here
	} else {
			c.Start()
			defer c.Stop()
			log.Println("Feed updater started. Running every 10 minutes.")
	} 

	done := make(chan bool, 1)
	
	go gracefulShutdown(server, db, c, done)

	err = server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
			panic(fmt.Sprintf("http server error: %s", err))
	}

	<-done
	log.Println("Graceful shutdown complete.")
}