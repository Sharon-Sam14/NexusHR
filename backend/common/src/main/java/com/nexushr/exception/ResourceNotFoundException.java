package com.nexushr.exception;

/*
 * Custom Exception
 * 
 * Thrown when requested resource is not found.
 */

public class ResourceNotFoundException extends RuntimeException {

    /*
     * Constructor
     */

    public ResourceNotFoundException(String message) {

        super(message);

    }

}
