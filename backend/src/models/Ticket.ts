import mongoose, { Schema } from 'mongoose';

export interface TicketMessageDocument {
  senderId: string;
  senderType: 'user' | 'admin';
  content: string;
  createdAt: Date;
  senderName?: string;
}

export interface TicketDocument {
  ticketId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  messages: TicketMessageDocument[];
  assignedTo?: string;
  metadata?: Record<string, unknown>;
}

const TicketMessageSchema = new Schema<TicketMessageDocument>(
  {
    senderId: { type: String, required: true },
    senderType: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    senderName: { type: String },
  },
  { _id: false }
);

const TicketSchema = new Schema<TicketDocument>(
  {
    ticketId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userEmail: { type: String },
    userName: { type: String },
    subject: { type: String, required: true },
    status: { type: String, default: 'OPEN' },
    priority: { type: String, default: 'MEDIUM' },
    category: { type: String, default: 'general' },
    messages: { type: [TicketMessageSchema], default: [] },
    assignedTo: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: function (_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const Ticket = mongoose.model<TicketDocument>('Ticket', TicketSchema);
