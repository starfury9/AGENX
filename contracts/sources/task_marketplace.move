// ============================================================
// AGENX — Task Marketplace Module
// Task lifecycle with escrow payments
// ============================================================

module agenx::task_marketplace {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::clock;

    // ── Structs ──────────────────────────────────────────────

    /// Task object — shared so multiple agents can interact
    public struct Task has key, store {
        id: UID,
        poster: address,
        description_blob_id: String,
        required_skills: vector<String>,
        reward: Coin<SUI>,
        deadline: u64,
        status: u8,
        assigned_to: address,
        result_blob_id: String,
        created_at: u64,
    }

    // ── Events ───────────────────────────────────────────────

    public struct TaskCreated has copy, drop {
        task_id: ID,
        poster: address,
        reward_amount: u64,
    }

    public struct TaskAssigned has copy, drop {
        task_id: ID,
        assigned_to: address,
    }

    public struct TaskCompleted has copy, drop {
        task_id: ID,
        worker: address,
        reward_amount: u64,
    }

    public struct TaskDisputed has copy, drop {
        task_id: ID,
    }

    // ── Constants ────────────────────────────────────────────

    const STATUS_OPEN: u8 = 0;
    const STATUS_ASSIGNED: u8 = 1;
    const STATUS_SUBMITTED: u8 = 2;
    const STATUS_COMPLETED: u8 = 3;
    const STATUS_DISPUTED: u8 = 4;
    const STATUS_CANCELLED: u8 = 5;

    const ZERO_ADDRESS: address = @0x0;

    // ── Errors ───────────────────────────────────────────────

    const ENotPoster: u64 = 0;
    const EInvalidStatus: u64 = 1;
    const ENotAssigned: u64 = 2;
    const ESelfAssign: u64 = 3;

    // ── Entry Functions ──────────────────────────────────────

    /// Create a new task with SUI locked as escrow
    public entry fun create_task(
        description_blob_id: String,
        required_skills: vector<String>,
        payment: Coin<SUI>,
        deadline_ms: u64,
        clock_obj: &clock::Clock,
        ctx: &mut TxContext,
    ) {
        let poster = tx_context::sender(ctx);
        let reward_amount = coin::value(&payment);

        let task = Task {
            id: object::new(ctx),
            poster,
            description_blob_id,
            required_skills,
            reward: payment,
            deadline: deadline_ms,
            status: STATUS_OPEN,
            assigned_to: ZERO_ADDRESS,
            result_blob_id: std::string::utf8(b""),
            created_at: clock::timestamp_ms(clock_obj),
        };

        let task_id = object::id(&task);

        event::emit(TaskCreated { task_id, poster, reward_amount });

        // Share the task so other agents can interact with it
        transfer::share_object(task);
    }

    /// Assign a task to a worker (only poster can call)
    public entry fun assign_task(
        task: &mut Task,
        worker: address,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == task.poster, ENotPoster);
        assert!(task.status == STATUS_OPEN, EInvalidStatus);
        assert!(worker != task.poster, ESelfAssign);

        task.status = STATUS_ASSIGNED;
        task.assigned_to = worker;

        event::emit(TaskAssigned {
            task_id: object::id(task),
            assigned_to: worker,
        });
    }

    /// Worker submits result
    public entry fun submit_result(
        task: &mut Task,
        result_blob_id: String,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == task.assigned_to, ENotAssigned);
        assert!(task.status == STATUS_ASSIGNED, EInvalidStatus);

        task.status = STATUS_SUBMITTED;
        task.result_blob_id = result_blob_id;
    }

    /// Poster approves — releases escrow to worker
    public entry fun approve_and_pay(
        task: &mut Task,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == task.poster, ENotPoster);
        assert!(task.status == STATUS_SUBMITTED, EInvalidStatus);

        task.status = STATUS_COMPLETED;

        let reward_amount = coin::value(&task.reward);
        let payment = coin::split(&mut task.reward, reward_amount, ctx);
        transfer::public_transfer(payment, task.assigned_to);

        event::emit(TaskCompleted {
            task_id: object::id(task),
            worker: task.assigned_to,
            reward_amount,
        });
    }

    /// Poster raises a dispute
    public entry fun dispute_task(
        task: &mut Task,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == task.poster, ENotPoster);
        assert!(task.status == STATUS_SUBMITTED, EInvalidStatus);

        task.status = STATUS_DISPUTED;

        event::emit(TaskDisputed { task_id: object::id(task) });
    }

    /// Cancel an open task and refund the poster
    public entry fun cancel_task(
        task: &mut Task,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == task.poster, ENotPoster);
        assert!(task.status == STATUS_OPEN, EInvalidStatus);

        task.status = STATUS_CANCELLED;

        let reward_amount = coin::value(&task.reward);
        let refund = coin::split(&mut task.reward, reward_amount, ctx);
        transfer::public_transfer(refund, task.poster);
    }

    // ── View Functions ───────────────────────────────────────

    public fun get_status(task: &Task): u8 { task.status }
    public fun get_poster(task: &Task): address { task.poster }
    public fun get_assigned_to(task: &Task): address { task.assigned_to }
    public fun get_reward_amount(task: &Task): u64 { coin::value(&task.reward) }
}
