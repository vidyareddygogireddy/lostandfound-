package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.ClaimRequest;
import com.campus.lostandfound.entity.Claim;
import com.campus.lostandfound.entity.Item;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.repository.ClaimRepository;
import com.campus.lostandfound.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;

    public Claim submitClaim(ClaimRequest request, User claimer) {
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!"ACTIVE".equalsIgnoreCase(item.getStatus())) {
            throw new RuntimeException("Cannot claim an item that is already resolved or inactive");
        }

        if (item.getUser().getUserId().equals(claimer.getUserId())) {
            throw new RuntimeException("You cannot submit a claim on an item you reported yourself");
        }

        String proof = (request.getProofDescription() != null && !request.getProofDescription().isBlank())
                ? request.getProofDescription()
                : ("I found this item! Please contact me directly at " + (claimer.getPhoneNumber() != null && !claimer.getPhoneNumber().isBlank() ? claimer.getPhoneNumber() : claimer.getEmail()));

        Claim claim = Claim.builder()
                .item(item)
                .claimer(claimer)
                .proofDescription(proof)
                .status("PENDING")
                .build();

        return claimRepository.save(claim);
    }

    public List<Claim> getClaimsByClaimer(User claimer) {
        return claimRepository.findByClaimerOrderByClaimIdDesc(claimer);
    }

    public List<Claim> getClaimsForFinder(User finder) {
        return claimRepository.findClaimsForUserItems(finder);
    }

    public List<Claim> getClaimsForItem(Long itemId, User user) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Only finder or admin can view all claims on an item
        if (!item.getUser().getUserId().equals(user.getUserId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Not authorized to view claims for this item");
        }

        return claimRepository.findByItemOrderByClaimIdDesc(item);
    }

    @Transactional
    public Claim updateClaimStatus(Long claimId, String newStatus, User reviewer) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        Item item = claim.getItem();

        // Only finder who reported the item or admin can approve/reject
        if (!item.getUser().getUserId().equals(reviewer.getUserId()) && !"ADMIN".equalsIgnoreCase(reviewer.getRole())) {
            throw new RuntimeException("Not authorized to review this claim");
        }

        if ("APPROVED".equalsIgnoreCase(newStatus)) {
            claim.setStatus("APPROVED");
            item.setStatus("RESOLVED");
            itemRepository.save(item);
        } else if ("REJECTED".equalsIgnoreCase(newStatus)) {
            claim.setStatus("REJECTED");
            // Item remains ACTIVE
        } else {
            throw new RuntimeException("Invalid claim status: " + newStatus);
        }

        return claimRepository.save(claim);
    }
}
