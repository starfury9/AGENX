// ============================================================
// AGENX — Agent Registry Module
// On-chain agent profiles as Sui objects
// ============================================================

module agenx::agent_registry {
    use std::string::String;
    use sui::event;

    // ── Structs ──────────────────────────────────────────────

    /// Agent profile — owned object representing an agent's identity
    public struct AgentProfile has key, store {
        id: UID,
        name: String,
        bio_blob_id: String,
        skills: vector<String>,
        trust_score: u64,
        tasks_completed: u64,
        tasks_posted: u64,
        total_earned: u64,
        total_spent: u64,
        total_ratings: u64,
        rating_sum: u64,
        disputes: u64,
        status: u8,
        created_at: u64,
    }

    // ── Events ───────────────────────────────────────────────

    public struct AgentRegistered has copy, drop {
        agent_id: ID,
        name: String,
        owner: address,
    }

    public struct AgentUpdated has copy, drop {
        agent_id: ID,
        trust_score: u64,
        tasks_completed: u64,
    }

    // ── Constants ────────────────────────────────────────────

    const STATUS_OFFLINE: u8 = 0;
    const STATUS_AVAILABLE: u8 = 1;
    const STATUS_BUSY: u8 = 2;

    const INITIAL_TRUST_SCORE: u64 = 5000; // 50.00 (2 decimal precision)

    // ── Errors ───────────────────────────────────────────────

    const EInvalidStatus: u64 = 0;
    const EInvalidRating: u64 = 1;

    // ── Entry Functions ──────────────────────────────────────

    /// Register a new agent profile
    public entry fun register(
        name: String,
        bio_blob_id: String,
        skills: vector<String>,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext,
    ) {
        let agent = AgentProfile {
            id: object::new(ctx),
            name,
            bio_blob_id,
            skills,
            trust_score: INITIAL_TRUST_SCORE,
            tasks_completed: 0,
            tasks_posted: 0,
            total_earned: 0,
            total_spent: 0,
            total_ratings: 0,
            rating_sum: 0,
            disputes: 0,
            status: STATUS_AVAILABLE,
            created_at: sui::clock::timestamp_ms(clock),
        };

        let agent_id = object::id(&agent);
        let owner = tx_context::sender(ctx);

        event::emit(AgentRegistered { agent_id, name: agent.name, owner });

        transfer::transfer(agent, owner);
    }

    /// Update agent status
    public entry fun update_status(
        agent: &mut AgentProfile,
        new_status: u8,
    ) {
        assert!(new_status <= STATUS_BUSY, EInvalidStatus);
        agent.status = new_status;
    }

    /// Update agent bio
    public entry fun update_bio(
        agent: &mut AgentProfile,
        new_bio_blob_id: String,
    ) {
        agent.bio_blob_id = new_bio_blob_id;
    }

    /// Update agent skills
    public entry fun update_skills(
        agent: &mut AgentProfile,
        new_skills: vector<String>,
    ) {
        agent.skills = new_skills;
    }

    /// Record task completion and update reputation
    public entry fun record_task_completion(
        agent: &mut AgentProfile,
        earned: u64,
        rating: u64,
    ) {
        assert!(rating >= 1 && rating <= 5, EInvalidRating);

        agent.tasks_completed = agent.tasks_completed + 1;
        agent.total_earned = agent.total_earned + earned;
        agent.total_ratings = agent.total_ratings + 1;
        agent.rating_sum = agent.rating_sum + rating;

        // Recalculate trust score (0–10000 for 2 decimal precision)
        let avg_rating = (agent.rating_sum * 10000) / (agent.total_ratings * 5);
        let completion_bonus = if (agent.tasks_completed > 15) { 3000 } else { agent.tasks_completed * 200 };
        let dispute_penalty = agent.disputes * 500;
        let base = 5000; // 50.00

        let score = base + (avg_rating * 25 / 100) + completion_bonus;
        let score = if (score > dispute_penalty) { score - dispute_penalty } else { 0 };
        agent.trust_score = if (score > 10000) { 10000 } else { score };

        event::emit(AgentUpdated {
            agent_id: object::id(agent),
            trust_score: agent.trust_score,
            tasks_completed: agent.tasks_completed,
        });
    }

    /// Record a dispute
    public entry fun record_dispute(agent: &mut AgentProfile) {
        agent.disputes = agent.disputes + 1;

        // Recalculate trust score
        let dispute_penalty = agent.disputes * 500;
        if (agent.trust_score > dispute_penalty) {
            agent.trust_score = agent.trust_score - 500;
        } else {
            agent.trust_score = 0;
        };
    }

    /// Increment tasks posted count
    public entry fun record_task_posted(
        agent: &mut AgentProfile,
        spent: u64,
    ) {
        agent.tasks_posted = agent.tasks_posted + 1;
        agent.total_spent = agent.total_spent + spent;
    }

    // ── View Functions ───────────────────────────────────────

    public fun get_trust_score(agent: &AgentProfile): u64 {
        agent.trust_score
    }

    public fun get_name(agent: &AgentProfile): String {
        agent.name
    }

    public fun get_tasks_completed(agent: &AgentProfile): u64 {
        agent.tasks_completed
    }
}
