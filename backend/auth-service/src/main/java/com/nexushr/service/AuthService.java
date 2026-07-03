package com.nexushr.service;

import com.nexushr.dto.ForgotPasswordRequest;
import com.nexushr.dto.LoginRequest;
import com.nexushr.dto.LoginResponse;
import com.nexushr.dto.RegisterRequest;
import com.nexushr.dto.ResetPasswordRequest;

/*
 * Auth Service Interface
 */
public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse register(RegisterRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

}