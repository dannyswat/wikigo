package users

type UserService struct {
	DB UserDB
}

func (s *UserService) Login(username, password string) (*User, error) {
	user, err := s.DB.GetUserByUserName(username)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, &UnauthorizedError{"invalid username or password"}
	}
	if user.IsLockedOut {
		return nil, &UnauthorizedError{"account is locked"}
	}
	ok, err := user.VerifyPassword(password)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, &UnauthorizedError{"invalid username or password"}
	}
	return user, nil
}

func (s *UserService) ChangePassword(username string, oldPassword, newPassword string) error {
	user, err := s.DB.GetUserByUserName(username)
	if err != nil {
		return err
	}
	if user == nil {
		return &UnauthorizedError{"invalid user"}
	}
	ok, err := user.VerifyPassword(oldPassword)
	if err != nil {
		return err
	}
	if !ok {
		return &UnauthorizedError{"invalid password"}
	}
	err = user.UpdatePassword(newPassword)
	if err != nil {
		return err
	}
	return s.DB.UpdateUser(user)
}
