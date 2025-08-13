package setting

type SecuritySetting struct {
	AllowCors               bool     `json:"allow_cors"`
	AllowedCorsOrigins      []string `json:"allowed_cors_origins"`
	AllowedCorsMethods      string   `json:"allowed_cors_methods"`
	FrameOptions            string   `json:"frame_options"`   // e.g., "SAMEORIGIN", "DENY", "ALLOW-FROM https://example.com"
	ReferrerPolicy          string   `json:"referrer_policy"` // e.g., "no-referrer", "origin", "strict-origin-when-cross-origin"
	StrictTransportSecurity string   `json:"strict_transport_security"`
	ContentSecurityPolicy   string   `json:"content_security_policy"`
	XContentTypeOptions     string   `json:"x_content_type_options"`
	XSSProtection           string   `json:"x_xss_protection"`
	XRobotsTag              string   `json:"x_robots_tag"` // e.g., "noindex, nofollow", "index, follow"
}

const (
	DefaultFrameOptions            = "SAMEORIGIN"
	DefaultReferrerPolicy          = "strict-origin-when-cross-origin"
	DefaultStrictTransportSecurity = "max-age=31536000; includeSubDomains"
	DefaultContentSecurityPolicy   = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';"
	DefaultXContentTypeOptions     = "nosniff"
	DefaultXSSProtection           = "1; mode=block"
	DefaultXRobotsTag              = "noindex, nofollow"
)
