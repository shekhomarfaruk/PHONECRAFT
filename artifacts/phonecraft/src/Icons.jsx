import {
  Home, Briefcase, Bell, BellOff, Wallet, Link, Users, MessageCircle, ShoppingBag,
  Headphones, BookOpen, Settings, ShieldCheck, Zap, Cpu, Smartphone,
  TrendingUp, Copy, Share2, ArrowRight, Star, CheckCircle, Lock, Mail,
  Package, Bot, ArrowLeftRight, Menu, X, Send, Sun, Moon, LogOut,
  Trophy, Gem, AlertTriangle, RefreshCw, Reply, Smile, Type, CreditCard,
  Globe, MoreVertical, AlertCircle, LifeBuoy, Download, Upload, FileText,
  Wrench, DollarSign, BarChart2, Target, Info, ChevronDown, Shield,
  UserCircle, Store, TrendingDown, Coins, BadgeDollarSign, Landmark,
  ClipboardList, Layers, Award, Gift, ChevronRight, ChevronLeft, ChevronUp,
  Eye, EyeOff, Search, Filter, Plus, Minus, Edit, Trash2, Ban,
  CheckSquare, XSquare, Clock, Calendar, MapPin, Phone, Camera,
  Wifi, Battery, Signal, Volume2, Vibrate, Fingerprint,
  QrCode, ScanLine, Sparkles, Flame, Rocket, Heart,
} from 'lucide-react';

const IC = (LucideIcon, defaultColor, defaultSize = 20, sw = 2) =>
  ({ size, color }) => (
    <LucideIcon
      size={size ?? defaultSize}
      color={color ?? defaultColor}
      strokeWidth={sw}
      style={{ flexShrink: 0 }}
    />
  );

const Icons = {
  Home:         IC(Home,           '#4ADE80'),
  Work:         IC(Briefcase,      '#A78BFA'),
  Bell:         IC(Bell,           '#FBBF24'),
  Wallet:       IC(Wallet,         '#60A5FA'),
  Link:         IC(Link,           '#FB923C'),
  User:         IC(Users,          '#F472B6'),
  People:       IC(Users,          '#F472B6'),
  Chat:         IC(MessageCircle,  '#2DD4BF'),
  Market:       IC(ShoppingBag,    '#FB923C'),
  Support:      IC(Headphones,     '#F87171'),
  Book:         IC(BookOpen,       '#38BDF8'),
  Settings:     IC(Settings,       '#94A3B8'),
  Shield:       IC(ShieldCheck,    '#FBBF24'),
  ShieldLock:   IC(ShieldCheck,    '#F59E0B'),
  Zap:          IC(Zap,            '#F59E0B', 14),
  Cpu:          IC(Cpu,            '#818CF8'),
  Smartphone:   IC(Smartphone,     '#60A5FA'),
  TrendUp:      IC(TrendingUp,     '#4ADE80'),
  TrendDown:    IC(TrendingDown,   '#F87171'),
  Copy:         IC(Copy,           '#23AF91', 16),
  Share:        IC(Share2,         '#F472B6', 16),
  ArrowRight:   IC(ArrowRight,     '#23AF91', 16),
  ChevronRight: IC(ChevronRight,   '#23AF91', 16),
  ChevronLeft:  IC(ChevronLeft,    '#94A3B8', 20),
  ChevronDown:  IC(ChevronDown,    '#23AF91', 16),
  ChevronUp:    IC(ChevronUp,      '#23AF91', 16),
  Star:         IC(Star,           '#FBBF24', 16),
  CheckCircle:  IC(CheckCircle,    '#4ADE80'),
  Lock:         IC(Lock,           '#F59E0B', 18),
  Mail:         IC(Mail,           '#60A5FA', 18),
  Package:      IC(Package,        '#F97316'),
  Bot:          IC(Bot,            '#06B6D4', 40),
  Transfer:     IC(ArrowLeftRight, '#818CF8'),
  Menu:         IC(Menu,           '#23AF91', 22, 2.2),
  X:            IC(X,              '#F87171'),
  Send:         IC(Send,           '#23AF91', 18),
  Sun:          IC(Sun,            '#FBBF24', 18),
  Moon:         IC(Moon,           '#818CF8', 18),
  Logout:       IC(LogOut,         '#EF4444'),
  Trophy:       IC(Trophy,         '#F59E0B', 16),
  Diamond:      IC(Gem,            '#A78BFA', 16),
  AlertTriangle:IC(AlertTriangle,  '#F59E0B', 16),
  AlertCircle:  IC(AlertCircle,    '#EF4444'),
  Refresh:      IC(RefreshCw,      '#23AF91', 16),
  Reply:        IC(Reply,          '#818CF8', 16),
  Smile:        IC(Smile,          '#FBBF24', 16),
  FontSize:     IC(Type,           '#818CF8', 16),
  CreditCard:   IC(CreditCard,     '#4ADE80', 16),
  Language:     IC(Globe,          '#23AF91', 16),
  Globe:        IC(Globe,          '#06B6D4'),
  MoreVertical: IC(MoreVertical,   '#23AF91', 16),
  Headset:      IC(Headphones,     '#F87171'),
  Lifebuoy:     IC(LifeBuoy,       '#F87171'),
  Download:     IC(Download,       '#4ADE80', 16),
  Upload:       IC(Upload,         '#818CF8', 16),
  Note:         IC(FileText,       '#F59E0B', 16),
  Document:     IC(FileText,       '#818CF8'),
  Wrench:       IC(Wrench,         '#4ADE80'),
  Dollar:       IC(DollarSign,     '#4ADE80'),
  BarChart:     IC(BarChart2,      '#818CF8'),
  Target:       IC(Target,         '#EF4444'),
  Info:         IC(Info,           '#818CF8'),
  Eye:          IC(Eye,            '#23AF91', 18),
  EyeOff:       IC(EyeOff,        '#94A3B8', 18),
  Search:       IC(Search,         '#23AF91', 18),
  Filter:       IC(Filter,         '#A78BFA', 16),
  Plus:         IC(Plus,           '#4ADE80', 18),
  Minus:        IC(Minus,          '#F87171', 18),
  Edit:         IC(Edit,           '#60A5FA', 16),
  Trash:        IC(Trash2,         '#EF4444', 16),
  Ban:          IC(Ban,            '#EF4444', 16),
  Clock:        IC(Clock,          '#94A3B8', 16),
  Sparkles:     IC(Sparkles,       '#FBBF24'),
  Flame:        IC(Flame,          '#F97316'),
  Rocket:       IC(Rocket,         '#818CF8'),
  Heart:        IC(Heart,          '#F472B6'),
  Fingerprint:  IC(Fingerprint,    '#23AF91'),
  QrCode:       IC(QrCode,         '#23AF91'),
  BellOff:      IC(BellOff,        '#94A3B8', 22),

  Coin: ({ size = 16 }) => (
    <img
      src="/balanceicon.png"
      alt="credit"
      style={{ width: size, height: size, objectFit: 'contain', verticalAlign: 'middle', display: 'inline-block' }}
    />
  ),

  Logo: ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#23AF91"/>
          <stop offset="100%" stopColor="#34D399"/>
        </linearGradient>
      </defs>
      <path d="M32 4L56 18v28L32 60 8 46V18L32 4z" fill="url(#logoGrad)" opacity="0.15" stroke="url(#logoGrad)" strokeWidth="1.5"/>
      <path d="M32 10L50.5 20.5v21L32 52 13.5 41.5v-21L32 10z" fill="none" stroke="url(#logoGrad)" strokeWidth="1"/>
      <path d="M24 44V20h10a8 8 0 010 16H28" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="20" r="2" fill="#23AF91"/>
      <circle cx="34" cy="20" r="2" fill="#23AF91"/>
      <circle cx="38" cy="28" r="2" fill="#34D399"/>
      <circle cx="34" cy="36" r="2" fill="#34D399"/>
      <circle cx="24" cy="44" r="2" fill="#23AF91"/>
      <line x1="38" y1="28" x2="48" y2="28" stroke="#23AF91" strokeWidth="1" opacity="0.5"/>
      <line x1="24" y1="44" x2="16" y2="44" stroke="#34D399" strokeWidth="1" opacity="0.5"/>
      <circle cx="48" cy="28" r="1.5" fill="#23AF91" opacity="0.6"/>
      <circle cx="16" cy="44" r="1.5" fill="#34D399" opacity="0.6"/>
    </svg>
  ),

  LogoMark: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="lmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#23AF91"/>
          <stop offset="100%" stopColor="#34D399"/>
        </linearGradient>
      </defs>
      <path d="M32 4L56 18v28L32 60 8 46V18L32 4z" fill="url(#lmGrad)" opacity="0.15" stroke="url(#lmGrad)" strokeWidth="2"/>
      <path d="M24 44V20h10a8 8 0 010 16H28" stroke="url(#lmGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="20" r="2" fill="#23AF91"/>
      <circle cx="38" cy="28" r="2" fill="#34D399"/>
      <circle cx="24" cy="44" r="2" fill="#23AF91"/>
    </svg>
  ),
};

export default Icons;
