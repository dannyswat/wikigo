package common

import (
	"os"
	"time"
)

func ExitApplication() {
	time.Sleep(1 * time.Second) // Give the response time to flush
	os.Exit(0)
}
