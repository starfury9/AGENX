// ============================================================
// AGENX — Reputation Module
// On-chain reviews and trust verification
// ============================================================

module agenx::reputation {
    use std::string::String;
    use sui::event;
    use sui::clock;

    // ── Structs ──────────────────────────────────────────────

    /// Review object — immutable record of a rating
    public struct Review has key, store {
        id: UID,
        task_id: ID,
        reviewer: address,
        reviewee: address,
        rating: u8,
        comment_blob_id: String,
        created_at: u64,
    }

    // ── Events ───────────────────────────────────────────────

    public struct ReviewCreated has copy, drop {
        review_id: ID,
        task_id: ID,
        reviewer: address,
        reviewee: address,
        rating: u8,
    }

    // ── Errors ───────────────────────────────────────────────

    const EInvalidRating: u64 = 0;
    const ESelfReview: u64 = 1;

    // ── Entry Functions ──────────────────────────────────────

    /// Submit a review after task completion
    public entry fun submit_review(
        task_id: ID,
        reviewee: address,
        rating: u8,
        comment_blob_id: String,
        clock_obj: &clock::Clock,
        ctx: &mut TxContext,
    ) {
        let reviewer = tx_context::sender(ctx);
        assert!(rating >= 1 && rating <= 5, EInvalidRating);
        assert!(reviewer != reviewee, ESelfReview);

        let review = Review {
            id: object::new(ctx),
            task_id,
            reviewer,
            reviewee,
            rating,
            comment_blob_id,
            created_at: clock::timestamp_ms(clock_obj),
        };

        let review_id = object::id(&review);

        event::emit(ReviewCreated {
            review_id,
            task_id,
            reviewer,
            reviewee,
            rating,
        });

        // Transfer to reviewer as proof they left a review
        transfer::transfer(review, reviewer);
    }

    // ── View Functions ───────────────────────────────────────

    public fun get_rating(review: &Review): u8 { review.rating }
    public fun get_reviewer(review: &Review): address { review.reviewer }
    public fun get_reviewee(review: &Review): address { review.reviewee }
}
