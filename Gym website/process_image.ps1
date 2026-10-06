Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class ImageProcessor {
    public static void Process(string inputPath, string outputPath) {
        using (Bitmap src = new Bitmap(inputPath)) {
            int w = src.Width;
            int h = src.Height;
            using (Bitmap dest = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                BitmapData destData = dest.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

                int bytes = Math.Abs(srcData.Stride) * h;
                byte[] srcBytes = new byte[bytes];
                byte[] destBytes = new byte[bytes];

                Marshal.Copy(srcData.Scan0, srcBytes, 0, bytes);
                src.UnlockBits(srcData);

                Array.Copy(srcBytes, destBytes, bytes);

                bool[] isBg = new bool[w * h];
                Queue<int> q = new Queue<int>();
                int stride = Math.Abs(srcData.Stride);

                // Add dark pixels on borders
                for (int x = 0; x < w; x++) {
                    AddIfDark(x, 0, w, h, stride, srcBytes, isBg, q);
                    AddIfDark(x, h - 1, w, h, stride, srcBytes, isBg, q);
                }
                for (int y = 0; y < h; y++) {
                    AddIfDark(0, y, w, h, stride, srcBytes, isBg, q);
                    AddIfDark(w - 1, y, w, h, stride, srcBytes, isBg, q);
                }

                int[] dx = { 1, -1, 0, 0 };
                int[] dy = { 0, 0, 1, -1 };

                while (q.Count > 0) {
                    int curr = q.Dequeue();
                    int cx = curr % w;
                    int cy = curr / w;

                    for (int i = 0; i < 4; i++) {
                        int nx = cx + dx[i];
                        int ny = cy + dy[i];
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                            int nidx = ny * w + nx;
                            if (!isBg[nidx]) {
                                int bOffset = ny * stride + nx * 4;
                                byte b = srcBytes[bOffset];
                                byte g = srcBytes[bOffset + 1];
                                byte r = srcBytes[bOffset + 2];
                                int maxVal = Math.Max(r, Math.Max(g, b));
                                // Threshold for background
                                if (maxVal <= 24) {
                                    isBg[nidx] = true;
                                    q.Enqueue(nidx);
                                }
                            }
                        }
                    }
                }

                // Also fade the bottom reflection below feet if needed
                // Feet are around y = 1100 to 1180
                for (int y = 0; y < h; y++) {
                    for (int x = 0; x < w; x++) {
                        int idx = y * w + x;
                        int bOffset = y * stride + x * 4;
                        if (isBg[idx]) {
                            destBytes[bOffset + 3] = 0; // Transparent
                        } else {
                            // Check if bordering background for antialiasing
                            bool nearBg = false;
                            for (int k = -1; k <= 1; k++) {
                                for (int m = -1; m <= 1; m++) {
                                    int qx = x + m;
                                    int qy = y + k;
                                    if (qx >= 0 && qx < w && qy >= 0 && qy < h) {
                                        if (isBg[qy * w + qx]) {
                                            nearBg = true;
                                            break;
                                        }
                                    }
                                }
                                if (nearBg) break;
                            }
                            byte b = srcBytes[bOffset];
                            byte g = srcBytes[bOffset + 1];
                            byte r = srcBytes[bOffset + 2];
                            int maxVal = Math.Max(r, Math.Max(g, b));
                            
                            // If it's the bottom reflection under feet (y > 1150)
                            if (y > 1150) {
                                float fade = 1.0f - (float)(y - 1150) / (h - 1150);
                                if (fade < 0) fade = 0;
                                destBytes[bOffset + 3] = (byte)(destBytes[bOffset + 3] * fade);
                            }

                            if (nearBg && maxVal < 50) {
                                float alphaRatio = (float)(maxVal - 10) / 40.0f;
                                if (alphaRatio < 0) alphaRatio = 0;
                                if (alphaRatio > 1) alphaRatio = 1;
                                destBytes[bOffset + 3] = (byte)(alphaRatio * 255);
                            }
                        }
                    }
                }

                Marshal.Copy(destBytes, 0, destData.Scan0, bytes);
                dest.UnlockBits(destData);
                dest.Save(outputPath, ImageFormat.Png);
            }
        }
    }

    private static void AddIfDark(int x, int y, int w, int h, int stride, byte[] srcBytes, bool[] isBg, Queue<int> q) {
        int idx = y * w + x;
        if (!isBg[idx]) {
            int bOffset = y * stride + x * 4;
            byte b = srcBytes[bOffset];
            byte g = srcBytes[bOffset + 1];
            byte r = srcBytes[bOffset + 2];
            int maxVal = Math.Max(r, Math.Max(g, b));
            if (maxVal <= 24) {
                isBg[idx] = true;
                q.Enqueue(idx);
            }
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[ImageProcessor]::Process('C:\Users\bhakt\.gemini\antigravity-ide\brain\dd07a5cf-0308-4e87-989c-3204c65110d2\hero_bodybuilder_1791179886634.jpg', 'c:\Users\bhakt\OneDrive\Desktop\Gym website\images\bodybuilder.png')
Write-Host "PNG generation complete!"
