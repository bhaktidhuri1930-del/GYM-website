Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class WhiteBgProcessor {
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

                // Check and add edge pixels that are light/white
                for (int x = 0; x < w; x++) {
                    AddIfWhite(x, 0, w, h, stride, srcBytes, isBg, q);
                    AddIfWhite(x, h - 1, w, h, stride, srcBytes, isBg, q);
                }
                for (int y = 0; y < h; y++) {
                    AddIfWhite(0, y, w, h, stride, srcBytes, isBg, q);
                    AddIfWhite(w - 1, y, w, h, stride, srcBytes, isBg, q);
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
                                
                                // In the white studio background, r, g, b are all high: min >= 230
                                int minVal = Math.Min(r, Math.Min(g, b));
                                int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(r - b), Math.Abs(g - b)));

                                // Plain neutral white/light-gray background
                                if (minVal >= 225 && maxDiff < 20) {
                                    isBg[nidx] = true;
                                    q.Enqueue(nidx);
                                }
                            }
                        }
                    }
                }

                // Check between legs:
                // Seed between legs if there is white
                for (int y = 700; y < 1050; y++) {
                    for (int x = 400; x < 580; x++) {
                        AddIfWhite(x, y, w, h, stride, srcBytes, isBg, q);
                    }
                }
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
                                int minVal = Math.Min(r, Math.Min(g, b));
                                int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(r - b), Math.Abs(g - b)));

                                if (minVal >= 225 && maxDiff < 20) {
                                    isBg[nidx] = true;
                                    q.Enqueue(nidx);
                                }
                            }
                        }
                    }
                }

                // Also check under armpits / arms
                for (int y = 300; y < 600; y++) {
                    for (int x = 280; x < 400; x++) {
                        AddIfWhite(x, y, w, h, stride, srcBytes, isBg, q);
                    }
                    for (int x = 600; x < 720; x++) {
                        AddIfWhite(x, y, w, h, stride, srcBytes, isBg, q);
                    }
                }
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
                                int minVal = Math.Min(r, Math.Min(g, b));
                                int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(r - b), Math.Abs(g - b)));

                                if (minVal >= 225 && maxDiff < 20) {
                                    isBg[nidx] = true;
                                    q.Enqueue(nidx);
                                }
                            }
                        }
                    }
                }

                // Apply alpha with antialiased edge smoothing
                for (int y = 0; y < h; y++) {
                    for (int x = 0; x < w; x++) {
                        int idx = y * w + x;
                        int bOffset = y * stride + x * 4;
                        if (isBg[idx]) {
                            destBytes[bOffset + 3] = 0; // Transparent
                        } else {
                            // Check if near background
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
                            int minVal = Math.Min(r, Math.Min(g, b));

                            if (nearBg && minVal >= 200) {
                                float alphaRatio = 1.0f - (float)(minVal - 200) / 45.0f;
                                if (alphaRatio < 0) alphaRatio = 0;
                                if (alphaRatio > 1) alphaRatio = 1;
                                destBytes[bOffset + 3] = (byte)(alphaRatio * 255);
                            }
                        }
                    }
                }

                // Clear any residual ground shadow below shoes (y >= 1150)
                for (int y = 1145; y < h; y++) {
                    for (int x = 0; x < w; x++) {
                        int idx = y * w + x;
                        int bOffset = y * stride + x * 4;
                        byte b = srcBytes[bOffset];
                        byte g = srcBytes[bOffset + 1];
                        byte r = srcBytes[bOffset + 2];
                        int minVal = Math.Min(r, Math.Min(g, b));
                        if (minVal > 140) {
                            destBytes[bOffset + 3] = 0;
                        }
                    }
                }

                Marshal.Copy(destBytes, 0, destData.Scan0, bytes);
                dest.UnlockBits(destData);
                dest.Save(outputPath, ImageFormat.Png);
            }
        }
    }

    private static void AddIfWhite(int x, int y, int w, int h, int stride, byte[] srcBytes, bool[] isBg, Queue<int> q) {
        int idx = y * w + x;
        if (!isBg[idx]) {
            int bOffset = y * stride + x * 4;
            byte b = srcBytes[bOffset];
            byte g = srcBytes[bOffset + 1];
            byte r = srcBytes[bOffset + 2];
            int minVal = Math.Min(r, Math.Min(g, b));
            int maxDiff = Math.Max(Math.Abs(r - g), Math.Max(Math.Abs(r - b), Math.Abs(g - b)));
            if (minVal >= 225 && maxDiff < 20) {
                isBg[idx] = true;
                q.Enqueue(idx);
            }
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[WhiteBgProcessor]::Process('C:\Users\bhakt\.gemini\antigravity-ide\brain\dd07a5cf-0308-4e87-989c-3204c65110d2\bodybuilder_white_bg_1791180270226.jpg', 'c:\Users\bhakt\OneDrive\Desktop\Gym website\images\bodybuilder.png')
Write-Host "White BG Removal Complete!"
