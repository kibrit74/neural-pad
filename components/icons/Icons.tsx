
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

export const SaveAsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
        <line x1="12" y1="11" x2="12" y2="17"></line>
        <line x1="9" y1="14" x2="15" y2="14"></line>
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
export const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <SVGIcon width="20" height="20" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></SVGIcon>;
export const PlusIcon = () => <SVGIcon><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></SVGIcon>;
export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => <SVGIcon width="16" height="16" {...props}><polyline points="4 6 8 10 12 6"></polyline></SVGIcon>;
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

export const Moon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </SVGIcon>
);

export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </SVGIcon>
);

export const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </SVGIcon>
);

export const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </SVGIcon>
);

export const CircleCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="9 12 11 14 15 10"></polyline>
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

export const SyncIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
    </SVGIcon>
);

export const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 6v6l4 2"></path>
    </SVGIcon>
);

export const PaperclipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </SVGIcon>
);

export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </SVGIcon>
);

export const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </SVGIcon>
);

export const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </SVGIcon>
);

export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </SVGIcon>
);

export const BellOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
        <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
        <path d="M18 8a6 6 0 0 0-9.33-5"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </SVGIcon>
);

export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </SVGIcon>
);

export const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon strokeWidth="0" fill="currentColor" {...props}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </SVGIcon>
);

export const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon strokeWidth="0" fill="currentColor" {...props}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </SVGIcon>
);

export const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </SVGIcon>
);

// Landing Page Additional Icons
export const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54"></path>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54"></path>
    </SVGIcon>
);

export const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </SVGIcon>
);

export const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon strokeWidth="0" fill="currentColor" {...props}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
    </SVGIcon>
);

export const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon strokeWidth="0" fill="currentColor" {...props}>
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
    </SVGIcon>
);

export const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon strokeWidth="0" fill="currentColor" {...props}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
    </SVGIcon>
);

export const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </SVGIcon>
);

export const PaletteIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <circle cx="13.5" cy="6.5" r="1.5"></circle>
        <circle cx="17.5" cy="10.5" r="1.5"></circle>
        <circle cx="8.5" cy="7.5" r="1.5"></circle>
        <circle cx="6.5" cy="12.5" r="1.5"></circle>
        <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"></path>
    </SVGIcon>
);

export const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </SVGIcon>
);

export const KeyboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
        <path d="M6 8h.001"></path>
        <path d="M10 8h.001"></path>
        <path d="M14 8h.001"></path>
        <path d="M18 8h.001"></path>
        <path d="M8 12h.001"></path>
        <path d="M12 12h.001"></path>
        <path d="M16 12h.001"></path>
        <path d="M7 16h10"></path>
    </SVGIcon>
);

export const MonitorIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
    </SVGIcon>
);

export const LaptopIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path>
    </SVGIcon>
);

export const TerminalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" y1="19" x2="20" y2="19"></line>
    </SVGIcon>
);

export const FlameIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </SVGIcon>
);

export const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </SVGIcon>
);

export const GraduationCapIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
    </SVGIcon>
);

export const BuildingIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <path d="M9 22v-4h6v4"></path>
        <path d="M8 6h.01"></path>
        <path d="M16 6h.01"></path>
        <path d="M12 6h.01"></path>
        <path d="M12 10h.01"></path>
        <path d="M12 14h.01"></path>
        <path d="M16 10h.01"></path>
        <path d="M16 14h.01"></path>
        <path d="M8 10h.01"></path>
        <path d="M8 14h.01"></path>
    </SVGIcon>
);

export const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </SVGIcon>
);

export const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </SVGIcon>
);

export const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </SVGIcon>
);

export const Share2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <SVGIcon {...props}>
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </SVGIcon>
);

