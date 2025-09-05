package errors

import "fmt"

type UnauthorizedError struct {
	Message string
}

func (e *UnauthorizedError) Error() string {
	return e.Message
}

func Unauthorized(message string) error {
	return &UnauthorizedError{Message: message}
}

func Unauthorizedf(format string, args ...interface{}) error {
	return &UnauthorizedError{Message: fmt.Sprintf(format, args...)}
}
func IsUnauthorizedError(err error) bool {
	_, ok := err.(*UnauthorizedError)
	return ok
}
