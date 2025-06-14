package apihelper

import (
	"log"

	"wikigo/internal/common/errors"
	"wikigo/internal/users"

	"github.com/labstack/echo/v4"
)

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
	ErrCodeRateLimit      ErrorCode = "RATE_LIMIT"
	ErrCodeForbidden      ErrorCode = "FORBIDDEN"
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

func NewRateLimitError(message string) ErrorResponse {
	return ErrorResponse{Message: message, Code: ErrCodeRateLimit}
}

func GetErrorStatus(err error) int {
	switch err.(type) {
	case *users.UnauthorizedError:
		return 401
	case *errors.ValidationError:
		return 400
	case *errors.AggregateValidationError:
		return 400
	default:
		return 500
	}
}

func ReturnErrorResponse(e echo.Context, err error) error {
	switch err := err.(type) {
	case *users.UnauthorizedError:
		return e.JSON(401, NewUnauthorizedError(err.Error()))
	case *errors.ValidationError:
		return e.JSON(400, NewInvalidRequestError(err.Error()))
	case *errors.AggregateValidationError:
		return e.JSON(400, NewInvalidResponseErrorWithDetails(err.Error(), err.Errors))
	default:
		log.Println(err)
		return e.JSON(500, NewInternalError("Internal server error"))
	}
}
