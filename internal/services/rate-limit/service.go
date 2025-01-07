package rateLimit

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type RateLimiter struct {
	limiters sync.Map // Maps IPs to their rate limiters
	limit    rate.Limit
	burst    int
}

func NewRateLimiter(rps float64, burst int) *RateLimiter {
	return &RateLimiter{
		limit: rate.Limit(rps),
		burst: burst,
	}
}

// GetLimiter retrieves or creates a rate limiter for a given IP
func (rl *RateLimiter) GetLimiter(ip string) *rate.Limiter {
	limiter, exists := rl.limiters.Load(ip)
	if !exists {
		// Create a new rate limiter if none exists for the IP
		limiter = rate.NewLimiter(rl.limit, rl.burst)
		rl.limiters.Store(ip, limiter)
	}
	return limiter.(*rate.Limiter)
}

func RateLimitMiddleware(rl *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := rl.GetLimiter(ip)

		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests, please try again later.",
			})
			return
		}
		c.Next()
	}
}
