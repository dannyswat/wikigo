package errors

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	if e.Field == "" {
		return e.Message
	}
	return e.Field + ": " + e.Message
}

func NewValidationError(message, field string) error {
	return &ValidationError{Field: field, Message: message}
}

type AggregateValidationError struct {
	Errors []ValidationError
}

func (e *AggregateValidationError) Error() string {
	return "Validation failed"
}

func (e *AggregateValidationError) AddError(err error) {
	if err == nil {
		return
	}
	if vErr, ok := err.(*ValidationError); ok {
		e.Errors = append(e.Errors, *vErr)
	}
	if aggErr, ok := err.(*AggregateValidationError); ok {
		e.Errors = append(e.Errors, aggErr.Errors...)
	}
}
