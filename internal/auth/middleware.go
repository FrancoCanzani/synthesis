package auth

import (
	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get token from Authorization header
        token := GetTokenFromHeader(c)
        if token == "" {
            c.AbortWithStatusJSON(401, gin.H{"error": "No authorization header"})
            return
        }

        // Verify the token
        claims, err := VerifyToken(token)
        if err != nil {
            c.AbortWithStatusJSON(401, gin.H{"error": err.Error()})
            return
        }

        // Extract user ID from claims
        userId, ok := claims["sub"].(string)
        if !ok {
            c.AbortWithStatusJSON(401, gin.H{"error": "Invalid user ID in token"})
            return
        }

        // Store user ID in context using consistent key
        c.Set("userId", userId)
        c.Next()
    }
}