/**
 * Customer Lifecycle State Machine
 *
 * Centralizes all lifecycle transition logic to prevent
 * business rules from being duplicated across components.
 */

import { LifecycleStatus, LifecycleTransitionResult } from './CustomerTypes';

/**
 * Lifecycle transition rules
 */
const TRANSITIONS: Record<LifecycleStatus, LifecycleStatus[]> = {
  [LifecycleStatus.LEAD]: [LifecycleStatus.ACTIVE],
  [LifecycleStatus.ACTIVE]: [LifecycleStatus.INACTIVE, LifecycleStatus.SUSPENDED],
  [LifecycleStatus.INACTIVE]: [LifecycleStatus.ACTIVE],
  [LifecycleStatus.SUSPENDED]: [LifecycleStatus.ACTIVE],
};

/**
 * Transition reasons for manual transitions
 */
export enum TransitionReason {
  FIRST_BOOKING = 'first_booking',
  NO_ACTIVITY = 'no_activity_90_days',
  NEW_BOOKING = 'new_booking',
  PAYMENT_ISSUE = 'payment_issue',
  POLICY_VIOLATION = 'policy_violation',
  ISSUE_RESOLVED = 'issue_resolved',
  MANUAL = 'manual',
}

/**
 * Customer Lifecycle Manager
 */
export class CustomerLifecycle {
  /**
   * Check if a transition is valid
   */
  static canTransition(from: LifecycleStatus, to: LifecycleStatus): boolean {
    return TRANSITIONS[from].includes(to);
  }

  /**
   * Check if customer can be activated
   */
  static canActivate(currentStatus: LifecycleStatus): boolean {
    return this.canTransition(currentStatus, LifecycleStatus.ACTIVE);
  }

  /**
   * Check if customer can be suspended
   */
  static canSuspend(currentStatus: LifecycleStatus): boolean {
    return this.canTransition(currentStatus, LifecycleStatus.SUSPENDED);
  }

  /**
   * Check if customer can be restored (from suspended)
   */
  static canRestore(currentStatus: LifecycleStatus): boolean {
    return currentStatus === LifecycleStatus.SUSPENDED;
  }

  /**
   * Check if customer can be deactivated (to inactive)
   */
  static canDeactivate(currentStatus: LifecycleStatus): boolean {
    return this.canTransition(currentStatus, LifecycleStatus.INACTIVE);
  }

  /**
   * Attempt a lifecycle transition
   */
  static transition(
    currentStatus: LifecycleStatus,
    targetStatus: LifecycleStatus
  ): LifecycleTransitionResult {
    if (!this.canTransition(currentStatus, targetStatus)) {
      return {
        success: false,
        newStatus: null,
        error: `Cannot transition from ${currentStatus} to ${targetStatus}`,
      };
    }

    return {
      success: true,
      newStatus: targetStatus,
    };
  }

  /**
   * Auto-transition based on booking activity
   * Called when a booking is created
   */
  static onBookingCreated(currentStatus: LifecycleStatus): LifecycleStatus {
    // Lead → Active on first booking
    if (currentStatus === LifecycleStatus.LEAD) {
      return LifecycleStatus.ACTIVE;
    }

    // Inactive → Active on new booking
    if (currentStatus === LifecycleStatus.INACTIVE) {
      return LifecycleStatus.ACTIVE;
    }

    return currentStatus;
  }

  /**
   * Auto-transition based on inactivity
   * Called when checking for inactive customers
   */
  static onInactivityCheck(
    currentStatus: LifecycleStatus,
    daysSinceLastActivity: number
  ): LifecycleStatus | null {
    // Active → Inactive after 90 days of inactivity
    if (currentStatus === LifecycleStatus.ACTIVE && daysSinceLastActivity >= 90) {
      return LifecycleStatus.INACTIVE;
    }

    return null;
  }

  /**
   * Get valid transitions for a given status
   */
  static getValidTransitions(currentStatus: LifecycleStatus): LifecycleStatus[] {
    return TRANSITIONS[currentStatus];
  }

  /**
   * Get transition description
   */
  static getTransitionDescription(from: LifecycleStatus, to: LifecycleStatus): string {
    const descriptions: Record<string, string> = {
      [`${LifecycleStatus.LEAD}→${LifecycleStatus.ACTIVE}`]: 'Customer activated on first booking',
      [`${LifecycleStatus.ACTIVE}→${LifecycleStatus.INACTIVE}`]: 'Customer marked inactive due to no activity',
      [`${LifecycleStatus.INACTIVE}→${LifecycleStatus.ACTIVE}`]: 'Customer reactivated on new booking',
      [`${LifecycleStatus.ACTIVE}→${LifecycleStatus.SUSPENDED}`]: 'Customer suspended by admin',
      [`${LifecycleStatus.SUSPENDED}→${LifecycleStatus.ACTIVE}`]: 'Customer restored by admin',
    };

    return descriptions[`${from}→${to}`] || 'Status updated';
  }
}
