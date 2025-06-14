package handlers

import (
	"wikigo/internal/setting"

	"github.com/labstack/echo/v4"
)

type SettingHandler struct {
	SettingService *setting.SettingService
}

func (h *SettingHandler) GetSetting(c echo.Context) error {
	setting, err := h.SettingService.GetSetting()
	if err != nil {
		return err
	}
	return c.JSON(200, setting)
}

func (h *SettingHandler) GetSecuritySetting(c echo.Context) error {
	securitySetting, err := h.SettingService.GetSecuritySetting()
	if err != nil {
		return err
	}
	return c.JSON(200, securitySetting)
}

func (h *SettingHandler) UpdateSetting(c echo.Context) error {
	var setting setting.Setting
	if err := c.Bind(&setting); err != nil {
		return c.JSON(400, map[string]string{"error": "Invalid input"})
	}
	if err := h.SettingService.UpdateSetting(&setting); err != nil {
		return c.JSON(400, map[string]string{"error": err.Error()})
	}
	return c.NoContent(204)
}

func (h *SettingHandler) UpdateSecuritySetting(c echo.Context) error {
	var securitySetting setting.SecuritySetting
	if err := c.Bind(&securitySetting); err != nil {
		return c.JSON(400, map[string]string{"error": "Invalid input"})
	}
	if err := h.SettingService.UpdateSecuritySetting(&securitySetting); err != nil {
		return c.JSON(400, map[string]string{"error": err.Error()})
	}
	return c.NoContent(204)
}
