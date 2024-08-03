package apihelper

type ErrorResponse struct {
	Message string    `json:"message"`
	Code    ErrorCode `json:"code"`
}

type ErrorResponseWithDetails[T interface{}] struct {
	Message string    `json:"message"`
	Code    ErrorCode `json:"code"`
	Details T         `json:"details"`
}

type ErrorCode string

const (
	ErrCodeInvalidRequest ErrorCode = "INVALID_REQUEST"
	ErrCodeInternalError  ErrorCode = "INTERNAL_ERROR"
	ErrCodeNotFound       ErrorCode = "NOT_FOUND"
	ErrCodeUnauthorized   ErrorCode = "UNAUTHORIZED"
)

func NewInvalidRequestError(message string) ErrorResponse {
	return ErrorResponse{Message: message, Code: ErrCodeInvalidRequest}
}

func NewInvalidResponseErrorWithDetails[T interface{}](message string, details T) ErrorResponseWithDetails[T] {
	return ErrorResponseWithDetails[T]{Message: message, Code: ErrCodeInvalidRequest, Details: details}
}

func NewInternalError(message string) ErrorResponse {
	return ErrorResponse{Message: message, Code: ErrCodeInternalError}
}

func NewNotFoundError(message string) ErrorResponse {
	return ErrorResponse{Message: message, Code: ErrCodeNotFound}
}

func NewUnauthorizedError(message string) ErrorResponse {
	return ErrorResponse{Message: message, Code: ErrCodeUnauthorized}
}
