package errors

import "fmt"

type ForbiddenError struct {
	Message string
}

func (e *ForbiddenError) Error() string {
	return e.Message
}

func Forbidden(message string) error {
	return &ForbiddenError{Message: message}
}

func Forbiddenf(format string, args ...interface{}) error {
	return &ForbiddenError{Message: fmt.Sprintf(format, args...)}
}

func IsForbiddenError(err error) bool {
	_, ok := err.(*ForbiddenError)
	return ok
}
