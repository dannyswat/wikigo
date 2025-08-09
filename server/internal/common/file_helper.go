package common

import (
	"encoding/json"
	"os"
)

func GetJsonFile[T any](fileName string) (*T, error) {
	if _, err := os.Stat(fileName); err == nil {
		data, err := os.ReadFile(fileName)
		if err != nil {
			return nil, err
		}
		var result T
		if err = json.Unmarshal(data, &result); err != nil {
			return nil, err
		}
		return &result, nil
	}
	return nil, os.ErrNotExist
}
