
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  const { filename } = await params;
  
  if (!filename || filename.length === 0) {
    return new NextResponse("File not found", { status: 404 });
  }

  // Join path segments to get the full filename
  const fileNameString = filename.join("/");
  
  // Security check to prevent directory traversal
  if (fileNameString.includes("..")) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "src/app/image", fileNameString);

  if (!existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  try {
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on extension
    const ext = path.extname(fileNameString).toLowerCase();
    let contentType = "application/octet-stream";
    
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".svg") contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
