
import React from 'react';

const SVGIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {props.children}
    </svg>
);

export const ChatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </SVGIcon>
);

export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </SVGIcon>
);

export const NotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </SVGIcon>
);

export const SaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </SVGIcon>
);

export const WandIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon width="20" height="20" {...props}>
        <path d="M15 4V2m0 20v-2m5-13h2M2 11h2m12.56-5.56L18 4m-9.06 9.06L8 12M4 6l1.41 1.41M18 18l1.41 1.41M12 8a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z"></path>
    </SVGIcon>
);

export const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon width="20" height="20" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </SVGIcon>
);

export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </SVGIcon>
);

export const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </SVGIcon>
);

export const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </SVGIcon>
);

export const SparkleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
    </SVGIcon>
);

// Icons for FormattingToolbar
export const BoldIcon = () => <SVGIcon><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></SVGIcon>;
export const ItalicIcon = () => <SVGIcon><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></SVGIcon>;
export const UnderlineIcon = () => <SVGIcon><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></SVGIcon>;
export const StrikeIcon = () => <SVGIcon><path d="M16 4H9a3 3 0 0 0-2.83 2H14a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H5"></path><path d="M4 12h16"></path></SVGIcon>;
export const CodeIcon = () => <SVGIcon><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></SVGIcon>;
export const ListIcon = () => <SVGIcon><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></SVGIcon>;
export const ListOrderedIcon = () => <SVGIcon><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4l-2-2h3"></path></SVGIcon>;
export const BlockquoteIcon = () => <SVGIcon><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h3v1c0 3-1 7-6 7z"></path><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h3v1c0 3-1 7-6 7z"></path></SVGIcon>;
export const RedoIcon = () => <SVGIcon><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></SVGIcon>;
export const UndoIcon = () => <SVGIcon><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3l-3 2.7"></path></SVGIcon>;
export const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => <SVGIcon {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></SVGIcon>;
export const SendIcon = () => <SVGIcon width="20" height="20"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></SVGIcon>;
export const PlusIcon = () => <SVGIcon><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></SVGIcon>;
export const ChevronDownIcon = () => <SVGIcon width="16" height="16"><polyline points="4 6 8 10 12 6"></polyline></SVGIcon>;
export const ChevronUpIcon = () => <SVGIcon width="16" height="16"><polyline points="12 10 8 6 4 10"></polyline></SVGIcon>;
export const UserIcon = () => <SVGIcon width="20" height="20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></SVGIcon>;
export const BotIcon = () => <SVGIcon width="20" height="20"><path d="M12 8V4H8"></path><rect x="4" y="12" width="16" height="8" rx="2"></rect><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M12 12v-1.5a2.5 2.5 0 0 0-5 0V12"></path></SVGIcon>;
export const HelpCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </SVGIcon>
);
export const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </SVGIcon>
);

export const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon strokeWidth="0" fill="currentColor" {...props}>
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </SVGIcon>
);

export const WindowsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon strokeWidth="0" fill="currentColor" {...props}>
        <path d="M3 5.557l7.357-1.002.004 7.097-7.354.042L3 5.557zm7.354 6.913l.006 7.103-7.354-1.011v-6.14l7.348.048zm.892-8.046L21.001 3v8.562l-9.755.077V4.424zm9.758 8.113l-.003 8.523-9.755-1.378-.014-7.161 9.772.016z" />
    </SVGIcon>
);

export const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="9" y="2" width="6" height="12" rx="3"></rect>
        <path d="M5 10v2a7 7 0 0 0 14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="22"></line>
    </SVGIcon>
);

export const StopIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="6" y="6" width="12" height="12" rx="2"></rect>
    </SVGIcon>
);

export const LinuxIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon strokeWidth="0" fill="currentColor" {...props}>
        <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.41 1.684-.287 2.489.845-.346 1.778-.527 2.743-.527.447 0 .886.052 1.31.148 1.547-1.65 3.662-2.666 6.03-2.666 2.369 0 4.484 1.017 6.03 2.666.425-.096.864-.148 1.311-.148.965 0 1.898.18 2.743.527.123-.805-.009-1.649-.287-2.489-.589-1.77-1.831-3.47-2.715-4.521-.75-1.067-.975-1.928-1.051-3.02-.065-1.491 1.056-5.965-3.17-6.298-.165-.013-.325-.021-.48-.021zm-2.951 6.298c.506 0 .917.41.917.917 0 .506-.41.916-.917.916-.506 0-.916-.41-.916-.916 0-.507.41-.917.916-.917zm5.902 0c.506 0 .917.41.917.917 0 .506-.411.916-.917.916-.506 0-.917-.41-.917-.916 0-.507.411-.917.917-.917zm-8.294 7.839c-.367.004-.72.062-1.061.166.02.481.13.955.33 1.406.346.78.857 1.475 1.496 2.066-.255.18-.51.361-.764.541-1.112.787-2.539 1.795-2.539 3.096 0 1.301 1.427 2.309 2.539 3.096.254.18.51.36.764.54-.639.591-1.15 1.286-1.496 2.066-.2.451-.31.925-.33 1.406.34.104.694.162 1.061.166.602.006 1.228-.123 1.848-.43.62-.306 1.234-.751 1.848-1.327.21-.228.42-.46.63-.691.21.23.42.463.63.691.614.576 1.229 1.021 1.849 1.327.62.307 1.246.436 1.848.43.367-.004.72-.062 1.061-.166-.02-.481-.13-.955-.33-1.406-.346-.78-.857-1.475-1.496-2.066.255-.18.51-.36.764-.54 1.112-.787 2.539-1.795 2.539-3.096 0-1.301-1.427-2.309-2.539-3.096-.254-.18-.509-.36-.764-.541.639-.591 1.15-1.286 1.496-2.066.2-.451.31-.925.33-1.406-.34-.104-.694-.162-1.061-.166-.602-.006-1.228.123-1.848.43-.62.307-1.235.751-1.849 1.327-.21.228-.42.46-.63.691-.21-.23-.42-.463-.63-.691-.614-.576-1.229-1.02-1.849-1.327-.62-.307-1.246-.436-1.848-.43z" />
    </SVGIcon>
);

export const PinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon width="16" height="16" {...props}>
        <path d="M12 2v6.5l3 3V18h-2v4l-1-1-1 1v-4H9v-6.5l3-3V2h1z" />
    </SVGIcon>
);

export const AddIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </SVGIcon>
);

export const RemoveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </SVGIcon>
);

export const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </SVGIcon>
);

export const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </SVGIcon>
);

export const WebhookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M18 16.016c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4z"></path>
        <path d="M6 16.016c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4z"></path>
        <path d="M12 8.016V4m0 16v-4.016M8.5 14l-3.5 3.5M19 10.5l-3.5 3.5"></path>
    </SVGIcon>
);

export const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V8a5 5 0 0 1 10 0v3"></path>
    </SVGIcon>
);

export const UnlockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V8a5 5 0 0 1 9 0"></path>
    </SVGIcon>
);

export const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <SVGIcon {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 6v6l4 2"></path>
  </SVGIcon>
);
