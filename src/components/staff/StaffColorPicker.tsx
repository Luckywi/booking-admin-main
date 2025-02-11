'use client';

interface StaffColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const availableColors = [
  '#FF6B6B', // Rouge corail vif
  '#00C1D4', // Cyan vif et moderne
  '#FF9F1C', // Orange vif
  '#6B5B95', // Violet pervenche
  '#FFE66D', // Jaune moutarde
  '#45B8AC', // Vert menthe
  '#FF3860', // Rose fuchsia
  '#A8E6CF'  // Vert pastel
];

export default function StaffColorPicker({ color, onChange }: StaffColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Couleur des rendez-vous</span>
      <div className="flex gap-2">
        {availableColors.map((colorOption) => (
          <button
            key={colorOption}
            type="button"
            onClick={() => onChange(colorOption)}
            className={`w-6 h-6 rounded-full border-2 ${
              color === colorOption ? 'border-gray-900' : 'border-transparent'
            }`}
            style={{ backgroundColor: colorOption }}
            aria-label={`Sélectionner la couleur ${colorOption}`}
          />
        ))}
      </div>
    </div>
  );
}