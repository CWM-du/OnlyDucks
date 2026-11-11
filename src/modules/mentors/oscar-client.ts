type OscarRequest = {
  mentorPromptKey: string;
  message: string;
  sessionId: string;
};

type OscarResponse = {
  text: string;
};

/**
 * Integration adapter scaffold.
 * Confirm Oscar API authentication, endpoint, request and response contracts
 * before implementing. Keep all calls server-side.
 */
export async function sendMessageToOscar(_input: OscarRequest): Promise<OscarResponse> {
  void _input;
  throw new Error('Oscar API integration is not configured.');
}
