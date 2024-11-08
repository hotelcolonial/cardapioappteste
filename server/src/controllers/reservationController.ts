import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend("re_AUvRraGb_PpXFXPT5Quu6GFwfkN9jWGSy");

export const createReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    fullName,
    phoneNumber,
    email,
    adults,
    children0to6,
    children7to11,
    type,
    total,
  } = req.body;

  try {
    const newReservation = await prisma.jantarReservation.create({
      data: {
        fullName,
        phoneNumber,
        email,
        adults: Number(adults),
        children0to6: Number(children0to6),
        children7to11: Number(children7to11),
        type: Number(type),
        verification: 0,
        total: Number(total),
      },
    });

    res.status(201).json(newReservation);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating category: ${error.message}` });
  }
};

export const getReservationByType = async (
  req: Request,
  res: Response
): Promise<void> => {
  const type = req.query.type;

  try {
    let selectedReservations = await prisma.jantarReservation.findMany({
      where: {
        type: Number(type),
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(selectedReservations);
  } catch (error: any) {
    res.status(500).json({
      message: `Error getting reservations by type: ${error.message}`,
    });
  }
};

export const updateReservationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { verification } = req.body;

  try {
    const updatedReservationStatus = await prisma.jantarReservation.update({
      where: {
        id: Number(id),
      },
      data: {
        verification,
      },
    });

    res.json(updatedReservationStatus);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating reservation status: ${error.message}` });
  }
};