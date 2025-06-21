package middlewares

import (
	"wikigo/internal/common/caching"
	"wikigo/internal/setting"

	"github.com/labstack/echo/v4"
)

type SecurityMiddleware struct {
	cache          *caching.SimpleCache[*setting.SecuritySetting]
	settingService *setting.SettingService
}

func NewSecurityMiddleware(settingService *setting.SettingService) *SecurityMiddleware {
	return &SecurityMiddleware{
		cache:          caching.NewSimpleCache[*setting.SecuritySetting](),
		settingService: settingService,
	}
}

func (sm *SecurityMiddleware) EchoSecurityMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			config, ok := sm.cache.Get()
			var err error
			if !ok {
				config, err = sm.settingService.GetSecuritySetting()
				if err != nil {
					config = &setting.SecuritySetting{}
				}
				sm.cache.Set(config)
			}
			err = next(c)
			header := c.Response().Header()
			// CORS
			if config.AllowCors && len(config.AllowedCorsOrigins) > 0 {
				header.Set("Access-Control-Allow-Origin", config.AllowedCorsOrigins[0])
			}
			if config.AllowCors && config.AllowedCorsMethods != "" {
				header.Set("Access-Control-Allow-Methods", config.AllowedCorsMethods)
			}
			if config.FrameOptions != "" {
				header.Set("X-Frame-Options", config.FrameOptions)
			}
			if config.ReferrerPolicy != "" {
				header.Set("Referrer-Policy", config.ReferrerPolicy)
			}
			if config.StrictTransportSecurity != "" {
				header.Set("Strict-Transport-Security", config.StrictTransportSecurity)
			}
			if config.ContentSecurityPolicy != "" {
				header.Set("Content-Security-Policy", config.ContentSecurityPolicy)
			}
			if config.XContentTypeOptions != "" {
				header.Set("X-Content-Type-Options", config.XContentTypeOptions)
			}
			if config.XSSProtection != "" {
				header.Set("X-XSS-Protection", config.XSSProtection)
			}
			if config.XRobotsTag != "" {
				header.Set("X-Robots-Tag", config.XRobotsTag)
			}
			return err
		}
	}
}
