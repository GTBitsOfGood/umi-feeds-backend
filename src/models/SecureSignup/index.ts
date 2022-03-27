import mongoose from 'mongoose';

export type SecureSignupDoc = mongoose.Document & {
  passcode: string;
}

const SecureSignupSchema = new mongoose.Schema<SecureSignupDoc>({
    passcode: { type: String, required: true }
});
export const SecureSignup = mongoose.model<SecureSignupDoc>('SecureSignup', SecureSignupSchema);
