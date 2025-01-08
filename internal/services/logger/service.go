package logger

import (
    "github.com/gin-gonic/gin"
    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
    "time"
)

func ZeroLogger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        raw := c.Request.URL.RawQuery

        c.Next()

        end := time.Now()
        latency := end.Sub(start)

        msg := "Request"
        if c.Errors.String() != "" {
            msg = c.Errors.String()
        }

        logger := log.With().
            Int("status", c.Writer.Status()).
            Str("method", c.Request.Method).
            Str("path", path).
            Str("query", raw).
            Str("ip", c.ClientIP()).
            Str("user-agent", c.Request.UserAgent()).
            Dur("latency", latency).
            Logger()

        switch {
        case c.Writer.Status() >= 500:
            logger.Error().Msg(msg)
        case c.Writer.Status() >= 400:
            logger.Warn().Msg(msg)
        default:
            logger.Info().Msg(msg)
        }
    }
}