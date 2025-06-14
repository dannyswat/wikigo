package setting

type Setting struct {
	SiteName string `json:"site_name"`
	Logo     string `json:"logo"`
	Theme    string `json:"theme"`
	Footer   string `json:"footer"`
	Language string `json:"language"`
}

type SecuritySetting struct {
	Cors                    string `json:"cors"`
	FrameOptions            string `json:"frame_options"`
	ReferrerPolicy          string `json:"referrer_policy"`
	StrictTransportSecurity string `json:"strict_transport_security"`
	ContentSecurityPolicy   string `json:"content_security_policy"`
	XContentTypeOptions     string `json:"x_content_type_options"`
	XSSProtection           string `json:"x_xss_protection"`
	XRobotsTag              string `json:"x_robots_tag"`
	PermissionsPolicy       string `json:"permissions_policy"`
	FeaturePolicy           string `json:"feature_policy"`
}
