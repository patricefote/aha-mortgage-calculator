import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");

    if (!state) {
      return NextResponse.json(
        { error: "State is required." },
        { status: 400 }
      );
    }

    const stateCode = state.toLowerCase();

    const response = await fetch(
      `https://apr.net/data/api/state/${stateCode}.json`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Unable to retrieve state mortgage data.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Mortgage rate API error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve mortgage rate data.",
      },
      { status: 500 }
    );
  }
}