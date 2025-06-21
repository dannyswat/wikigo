package setting

import "wikigo/internal/common/caching"

type SettingService struct {
	DB    SettingRepository
	Cache *caching.SimpleCache[*SecuritySetting]
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
	err := s.DB.UpdateSecuritySetting(securitySetting)
	if err == nil {
		s.Cache.Set(securitySetting)
	}
	return err
}

func ValidateSetting(setting *Setting) error {
	return nil
}

func ValidateSecuritySetting(securitySetting *SecuritySetting) error {
	return nil
}
