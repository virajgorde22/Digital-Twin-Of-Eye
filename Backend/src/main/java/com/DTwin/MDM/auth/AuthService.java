package com.DTwin.MDM.auth;

import com.DTwin.MDM.user.User;
import com.DTwin.MDM.user.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserService userService,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {

        this.userService = userService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public String register(RegisterRequest request) {

        User user = userService.registerUser(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );

        UserDetails userDetails =
                userService.loadUserByUsername(user.getEmail());

        return jwtService.generateToken(userDetails);
    }

    public String login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails =
                userService.loadUserByUsername(
                        request.getEmail()
                );

        return jwtService.generateToken(userDetails);
    }
}