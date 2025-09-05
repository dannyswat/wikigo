package errors

import "fmt"

type NotFoundError struct {
	Message string
}

func (e *NotFoundError) Error() string {
	return e.Message
}

func NotFound(message string) error {
	return &NotFoundError{Message: message}
}

func NotFoundf(format string, args ...interface{}) error {
	return &NotFoundError{Message: fmt.Sprintf(format, args...)}
}

func IsNotFoundError(err error) bool {
	_, ok := err.(*NotFoundError)
	return ok
}
