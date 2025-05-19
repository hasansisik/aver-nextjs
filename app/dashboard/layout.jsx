"use client";

import "@/app/globals.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMyProfile } from "@/redux/actions/userActions";

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  return children;
} 