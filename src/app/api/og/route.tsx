import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Cemre Park";
    const price = searchParams.get("price");
    const category = searchParams.get("category");
    const imageUrl = searchParams.get("image");

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f141e",
            backgroundImage: "radial-gradient(circle at 25px 25px, #d61c7b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #a855f7 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "80%",
              height: "70%",
              backgroundColor: "rgba(20, 25, 35, 0.9)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "40px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "60%",
                paddingRight: "20px",
              }}
            >
              {category && (
                <span
                  style={{
                    color: "#a855f7",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "20px",
                  }}
                >
                  {category}
                </span>
              )}
              <h1
                style={{
                  fontSize: title.length > 40 ? "48px" : "64px",
                  fontWeight: "900",
                  color: "#ffffff",
                  lineHeight: "1.2",
                  marginBottom: "30px",
                }}
              >
                {title}
              </h1>
              {price && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "56px",
                      fontWeight: "900",
                      color: "#d61c7b",
                      marginRight: "10px",
                    }}
                  >
                    ₺{price}
                  </span>
                </div>
              )}
            </div>

            {imageUrl && (
              <div
                style={{
                  display: "flex",
                  width: "35%",
                  height: "100%",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "4px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>
          
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "32px", fontWeight: "bold", color: "#ffffff", letterSpacing: "0.05em" }}>
              Cemre Park <span style={{ color: "#d61c7b" }}>Enterprise</span>
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
