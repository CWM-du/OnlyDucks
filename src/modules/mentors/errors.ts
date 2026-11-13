export class DomainError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class ActiveSessionConflictError extends DomainError {
  public readonly activeSessionId?: string;

  constructor(activeSessionId?: string) {
    super('User already has an active mentor session.', 409);
    this.activeSessionId = activeSessionId;
  }
}

export class MentorNotFoundError extends DomainError {
  public readonly mentorSlug: string;

  constructor(mentorSlug: string) {
    super(`Mentor profile not found: ${mentorSlug}`, 404);
    this.mentorSlug = mentorSlug;
  }
}

export class SessionNotFoundError extends DomainError {
  public readonly sessionId: string;

  constructor(sessionId: string) {
    super(`Mentor session not found: ${sessionId}`, 404);
    this.sessionId = sessionId;
  }
}

export class InvalidSessionStateError extends DomainError {
  public readonly currentStatus: string;

  constructor(currentStatus: string) {
    super(`Cannot transition session from current status: ${currentStatus}`, 409);
    this.currentStatus = currentStatus;
  }
}

