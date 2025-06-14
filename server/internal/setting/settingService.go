package setting

import "wikigo/internal/common/errors"

type SettingService struct {
	DB SettingRepository
}

func (s *SettingService) Init(initial *Setting, initialSecurity *SecuritySetting) error {
	return s.DB.Init(initial, initialSecurity)
}

func (s *SettingService) GetSetting() (*Setting, error) {
	setting, err := s.DB.GetSetting()
	if err != nil {
		return nil, err
	}
	return setting, nil
}
func (s *SettingService) GetSecuritySetting() (*SecuritySetting, error) {
	securitySetting, err := s.DB.GetSecuritySetting()
	if err != nil {
		return nil, err
	}
	return securitySetting, nil
}
func (s *SettingService) UpdateSetting(setting *Setting) error {
	if err := ValidateSetting(setting); err != nil {
		return err
	}
	return s.DB.UpdateSetting(setting)
}
func (s *SettingService) UpdateSecuritySetting(securitySetting *SecuritySetting) error {
	if err := ValidateSecuritySetting(securitySetting); err != nil {
		return err
	}
	return s.DB.UpdateSecuritySetting(securitySetting)
}

func ValidateSetting(setting *Setting) error {
	if setting.SiteName == "" {
		return errors.NewValidationError("site name cannot be empty", "SiteName")
	}
	if setting.Logo == "" {
		return errors.NewValidationError("logo cannot be empty", "Logo")
	}
	if setting.Theme == "" {
		return errors.NewValidationError("theme cannot be empty", "Theme")
	}
	if setting.Footer == "" {
		return errors.NewValidationError("footer cannot be empty", "Footer")
	}
	if setting.Language == "" {
		return errors.NewValidationError("language cannot be empty", "Language")
	}
	return nil
}

func ValidateSecuritySetting(securitySetting *SecuritySetting) error {
	if securitySetting.Cors == "" {
		return errors.NewValidationError("CORS cannot be empty", "Cors")
	}
	if securitySetting.FrameOptions == "" {
		return errors.NewValidationError("Frame Options cannot be empty", "FrameOptions")
	}
	if securitySetting.ReferrerPolicy == "" {
		return errors.NewValidationError("Referrer Policy cannot be empty", "ReferrerPolicy")
	}
	if securitySetting.StrictTransportSecurity == "" {
		return errors.NewValidationError("Strict Transport Security cannot be empty", "StrictTransportSecurity")
	}
	if securitySetting.ContentSecurityPolicy == "" {
		return errors.NewValidationError("Content Security Policy cannot be empty", "ContentSecurityPolicy")
	}
	if securitySetting.XContentTypeOptions == "" {
		return errors.NewValidationError("X Content Type Options cannot be empty", "XContentTypeOptions")
	}
	if securitySetting.XSSProtection == "" {
		return errors.NewValidationError("XSS Protection cannot be empty", "XSSProtection")
	}
	if securitySetting.XRobotsTag == "" {
		return errors.NewValidationError("X Robots Tag cannot be empty", "XRobotsTag")
	}
	if securitySetting.PermissionsPolicy == "" {
		return errors.NewValidationError("Permissions Policy cannot be empty", "PermissionsPolicy")
	}
	if securitySetting.FeaturePolicy == "" {
		return errors.NewValidationError("Feature Policy cannot be empty", "FeaturePolicy")
	}
	return nil
}
