package com.nexushr.service;

import com.nexushr.dto.LoginRequest;
import com.nexushr.dto.LoginResponse;
import com.nexushr.dto.RegisterRequest;

/*
 * Auth Service Interface
 */
public interface AuthService {

    LoginResponse login(LoginRequest request);

    LoginResponse register(RegisterRequest request);

}