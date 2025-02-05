import React, { useEffect, useRef, forwardRef } from 'react';

const ResultsCanvas = forwardRef<HTMLCanvasElement, {
  econ: number;
  dipl: number;
  govt: number;
  scty: number;
  closestMatch: string;
}>(({ econ, dipl, govt, scty, closestMatch }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to load images
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    const drawIcon = (img: HTMLImageElement, x: number, y: number, size: number = 50) => {
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    };

    const roundRect = (x: number, y: number, w: number, h: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    };

    // Enhanced hexagonal pattern
    const drawHexPattern = (x: number, y: number) => {
      const size = 30;
      const h = size * Math.sqrt(3);
      ctx.strokeStyle = 'rgba(76, 170, 158, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const nextX = x + size * Math.cos(angle);
        const nextY = y + size * Math.sin(angle);
        ctx.lineTo(nextX, nextY);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const drawCanvas = async () => {
      // Load all images
      const logo = await loadImage('/MindVaultLogoTransparentHD.svg');
      const icons = {
        equality: await loadImage('/equality-icon.svg'),
        market: await loadImage('/market-icon.svg'),
        nation: await loadImage('/nation-icon.svg'),
        globe: await loadImage('/globe-icon.svg'),
        authority: await loadImage('/authority-icon.svg'),
        liberty: await loadImage('/liberty-icon.svg'),
        tradition: await loadImage('/tradition-icon.svg'),
        progress: await loadImage('/progress-icon.svg'),
      };

      // Background gradient
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.height
      );
      bgGradient.addColorStop(0, '#0C1E1E');
      bgGradient.addColorStop(1, '#081616');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw hex pattern
      for (let i = 0; i < canvas.width; i += 60) {
        for (let j = 0; j < canvas.height; j += 52) {
          drawHexPattern(i, j);
        }
      }

      // Main panel
      const gradient = ctx.createLinearGradient(25, 100, canvas.width - 80, 100);
      gradient.addColorStop(0, '#1E3232');
      gradient.addColorStop(1, '#243C3C');
      ctx.fillStyle = gradient;
      roundRect((canvas.width - (canvas.width - 80)) / 2, 100, canvas.width - 80, 360, 30);
      ctx.fill();

      // Border glow
      ctx.shadowColor = 'rgba(64, 224, 208, 0.15)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = 'rgba(64, 224, 208, 0.2)';
      ctx.lineWidth = 2;
      roundRect((canvas.width - (canvas.width - 80)) / 2, 100, canvas.width - 80, 360, 30);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Logo
      drawIcon(logo, canvas.width / 2, 180, 120);

      // Title text
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#E5E7EB';
      ctx.textAlign = 'center';
      ctx.font = 'bold 76px Inter';
      ctx.fillText('MindVault', canvas.width / 2, 320);
      ctx.fillText('Political Compass', canvas.width / 2, 400);

      // Subtitle
      ctx.font = '32px Inter';
      ctx.fillText('Discover Your Political Identity', canvas.width / 2, 510);

      // Axis drawer
      const drawAxis = (
        label: string,
        leftLabel: string,
        rightLabel: string,
        rightValue: number,
        y: number,
        leftColor: string,
        rightColor: string,
        leftIcon: HTMLImageElement,
        rightIcon: HTMLImageElement
      ) => {
        const barWidth = canvas.width - 160;
        const barHeight = 80;
        const x = (canvas.width - barWidth) / 2;
        const PADDING = 20;
        const ICON_SIZE = 50;

        // Label
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#E5E7EB';
        ctx.font = 'bold 36px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(label, canvas.width / 2, y - 35);
        ctx.shadowBlur = 0;

        // Background bar
        ctx.fillStyle = '#1A2C2C';
        roundRect(x, y, barWidth, barHeight, barHeight / 2);
        ctx.fill();

        const leftValue = 100 - rightValue;
        const meetingPoint = x + (barWidth * leftValue / 100);

        // Left gradient
        if (leftValue > 0) {
          const leftGradient = ctx.createLinearGradient(x, y, meetingPoint, y);
          leftGradient.addColorStop(0, '#FF9B45');
          leftGradient.addColorStop(1, '#E69A45');
          ctx.fillStyle = leftGradient;
          roundRect(x, y, meetingPoint - x, barHeight, barHeight / 2);
          ctx.fill();

          if (leftValue >= 10) {
            ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#0C1E1E';
            ctx.font = 'bold 28px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`${leftValue}%`, x + PADDING, y + barHeight / 2 + 10);
            ctx.shadowBlur = 0;
          }
        }

        // Right gradient
        if (rightValue > 0) {
          const rightEnd = x + barWidth;
          const rightGradient = ctx.createLinearGradient(meetingPoint, y, rightEnd, y);
          rightGradient.addColorStop(0, '#4BAA9E');
          rightGradient.addColorStop(1, '#40E0D0');
          ctx.fillStyle = rightGradient;
          roundRect(meetingPoint, y, rightEnd - meetingPoint, barHeight, barHeight / 2);
          ctx.fill();

          if (rightValue >= 10) {
            ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#243C3C';
            ctx.font = 'bold 28px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(`${rightValue}%`, rightEnd - PADDING, y + barHeight / 2 + 10);
            ctx.shadowBlur = 0;
          }
        }

        // Indicator
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(meetingPoint, y + barHeight / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Icons
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 10;
        drawIcon(leftIcon, x + 50, y - 35, ICON_SIZE);
        drawIcon(rightIcon, x + barWidth - 50, y - 35, ICON_SIZE);
        ctx.shadowBlur = 0;

        // Labels
        ctx.fillStyle = '#E5E7EB';
        ctx.font = 'bold 28px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(leftLabel, x, y + barHeight + 35);
        ctx.textAlign = 'right';
        ctx.fillText(rightLabel, x + barWidth, y + barHeight + 35);
      };

      // Draw the four axes
      drawAxis('Economic Axis', 'Equality', 'Markets', econ, 640, '#FF9B45', '#40E0D0', icons.equality, icons.market);
      drawAxis('Diplomatic Axis', 'Nation', 'Globe', dipl, 840, '#FFB347', '#45D1C5', icons.nation, icons.globe);
      drawAxis('Government Axis', 'Authority', 'Liberty', govt, 1040, '#FFA500', '#48D1C0', icons.authority, icons.liberty);
      drawAxis('Societal Axis', 'Tradition', 'Progress', scty, 1240, '#FF8C00', '#43E0D0', icons.tradition, icons.progress);

      // Closest match box
      ctx.shadowColor = 'rgba(64, 224, 208, 0.2)';
      ctx.shadowBlur = 20;
      const matchGradient = ctx.createLinearGradient(40, 1400, canvas.width - 40, 1400);
      matchGradient.addColorStop(0, '#1E3232');
      matchGradient.addColorStop(1, '#243C3C');
      ctx.fillStyle = matchGradient;
      roundRect(40, 1410, canvas.width - 80, 290, 30);
      ctx.fill();

      ctx.strokeStyle = 'rgba(64, 224, 208, 0.2)';
      ctx.lineWidth = 2;
      roundRect(40, 1410, canvas.width - 80, 290, 30);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Match text
      const textGradient = ctx.createLinearGradient(
        canvas.width / 2 - 200, 1580,
        canvas.width / 2 + 200, 1580
      );
      textGradient.addColorStop(0, '#E5E7EB');
      textGradient.addColorStop(0.5, '#FFFFFF');
      textGradient.addColorStop(1, '#E5E7EB');

      ctx.fillStyle = '#D1D5DB';
      ctx.font = '36px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Your Closest Match', canvas.width / 2, 1480);

      ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = textGradient;
      ctx.font = 'bold 64px Inter';
      ctx.fillText(closestMatch, canvas.width / 2, 1590);
      ctx.shadowBlur = 0;

      // Footer
      ctx.fillStyle = '#D1D5DB';
      ctx.font = '32px Inter';
      ctx.fillText('Tag @MindVault & share your results!', canvas.width / 2, 1760);

      // CTA button
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#4BAA9E";
      roundRect(canvas.width / 2 - 350, 1810, 700, 60, 30);
      ctx.fill();

      ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Inter';
      ctx.fillText('Get the full experience on WorldApp', canvas.width / 2, 1850);
      ctx.shadowBlur = 0;
    };

    drawCanvas().catch(console.error);
  }, [econ, dipl, govt, scty, closestMatch]);

  return (
    <canvas
      ref={(node) => {
        canvasRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      width={1080}
      height={1920}
      className="mx-auto w-full h-auto"
    />
  );
});

export default ResultsCanvas;
