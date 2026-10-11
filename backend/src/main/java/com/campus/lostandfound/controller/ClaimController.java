package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.ClaimRequest;
import com.campus.lostandfound.entity.Claim;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.service.ClaimService;
import com.campus.lostandfound.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<Claim> submitClaim(@Valid @RequestBody ClaimRequest request) {
        User claimer = userService.getCurrentUser();
        Claim claim = claimService.submitClaim(request, claimer);
        return ResponseEntity.status(HttpStatus.CREATED).body(claim);
    }

    @GetMapping("/my-claims")
    public ResponseEntity<List<Claim>> getMyClaims() {
        User claimer = userService.getCurrentUser();
        List<Claim> claims = claimService.getClaimsByClaimer(claimer);
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/received")
    public ResponseEntity<List<Claim>> getReceivedClaims() {
        User finder = userService.getCurrentUser();
        List<Claim> claims = claimService.getClaimsForFinder(finder);
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<Claim>> getClaimsForItem(@PathVariable Long itemId) {
        User user = userService.getCurrentUser();
        List<Claim> claims = claimService.getClaimsForItem(itemId, user);
        return ResponseEntity.ok(claims);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Claim> updateClaimStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        User reviewer = userService.getCurrentUser();
        String status = body.get("status");
        Claim updatedClaim = claimService.updateClaimStatus(id, status, reviewer);
        return ResponseEntity.ok(updatedClaim);
    }
}
