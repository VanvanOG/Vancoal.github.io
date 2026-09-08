import {ClipboardList} from 'lucide-react';
import './commission-cover.css';
export default function CommissionCover({slug='ai-commission'}:{slug?:string}){const ava=slug==='ava-league';return <div className="commission-cover">{!ava&&<ClipboardList size={52} strokeWidth={1.2}/>}<strong>{ava?'AVA 联赛':'AI 委托'}</strong><span>{ava?'数据埋点 · 界面决策':'了解偏好 · 完成设计'}</span></div>;}
