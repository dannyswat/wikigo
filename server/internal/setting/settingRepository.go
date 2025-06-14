package setting

type SettingRepository interface {
	Init(initial *Setting, initialSecurity *SecuritySetting) error
	GetSetting() (*Setting, error)
	GetSecuritySetting() (*SecuritySetting, error)
	UpdateSetting(setting *Setting) error
	UpdateSecuritySetting(securitySetting *SecuritySetting) error
}
