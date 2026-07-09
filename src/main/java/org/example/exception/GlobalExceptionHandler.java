package org.example.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> erori = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String numeCamp = ((FieldError) error).getField();
            String mesajEroare = error.getDefaultMessage();
            erori.put(numeCamp, mesajEroare);
        });


        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erori);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleEroriGenerale(Exception ex) {
        Map<String, String> eroare = new HashMap<>();
        eroare.put("eroare_fatala", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(eroare);
    }
}