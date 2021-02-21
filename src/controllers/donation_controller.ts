import { Request, Response, NextFunction } from 'express';
import { Donation } from '../models/Donation';

/**
 * Deletes Donations
 * @route DELETE /donations/:donation_id
 */
export const deleteDonation = (req: Request, res: Response) => {
  const id: Number = parseInt(req.params.donation_id, 10);
  return Donation.remove(id)
    .then(() => res.status(200).json({ success: true }))
    .catch((error: Error) => 
      res.status(400).json({ success: false, message: error.message })
    );
};


