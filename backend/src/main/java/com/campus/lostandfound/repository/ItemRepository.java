package com.campus.lostandfound.repository;

import com.campus.lostandfound.entity.Item;
import com.campus.lostandfound.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByUserOrderByItemIdDesc(User user);

    List<Item> findByItemTypeOrderByItemIdDesc(String itemType);

    @Query("SELECT i FROM Item i WHERE " +
           "(:itemType IS NULL OR i.itemType = :itemType) AND " +
           "(:category IS NULL OR i.category = :category) AND " +
           "(:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR i.status = :status) " +
           "ORDER BY i.itemId DESC")
    List<Item> searchAndFilter(
            @Param("itemType") String itemType,
            @Param("category") String category,
            @Param("location") String location,
            @Param("search") String search,
            @Param("status") String status
    );
}
