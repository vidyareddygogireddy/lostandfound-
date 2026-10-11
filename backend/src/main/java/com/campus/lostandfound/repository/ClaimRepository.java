package com.campus.lostandfound.repository;

import com.campus.lostandfound.entity.Claim;
import com.campus.lostandfound.entity.Item;
import com.campus.lostandfound.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByItemOrderByClaimIdDesc(Item item);

    List<Claim> findByClaimerOrderByClaimIdDesc(User claimer);

    @Query("SELECT c FROM Claim c WHERE c.item.user = :user ORDER BY c.claimId DESC")
    List<Claim> findClaimsForUserItems(@Param("user") User user);
}
