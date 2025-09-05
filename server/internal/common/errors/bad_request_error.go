package errors

import "fmt"

type BadRequestError struct {
	Message string
}

func (e *BadRequestError) Error() string {
	return e.Message
}

func BadRequest(message string) error {
	return &BadRequestError{Message: message}
}

func BadRequestf(format string, args ...interface{}) error {
	return &BadRequestError{Message: fmt.Sprintf(format, args...)}
}

func IsBadRequestError(err error) bool {
	_, ok := err.(*BadRequestError)
	return ok
}
