export default function ProjectArt({ id }: { id: string }) {
  const colors: Record<string, string> = { buffet: '#f4bb82', lylink: '#b8bce9', tanks: '#b8cf95', menu: '#a7cec2', platformer: '#ecc692', 'lylink-jellyfin': '#b7cbe6', jshort: '#e2b4c6', blogfinity: '#d5c8a4', gamelist: '#b9d5c0' };
  return <svg className="project-art" viewBox="0 0 480 270" aria-hidden="true" focusable="false">
    <rect width="480" height="270" fill={colors[id] ?? '#b8cfc8'} />
    <path d="M0 230H480M35 0V270M445 0V270" stroke="#253b36" opacity=".13" />
    <rect x="96" y="38" width="292" height="194" rx="4" fill="#253b36" opacity=".13" />
    <rect x="88" y="30" width="292" height="194" rx="4" fill="#faf7ed" stroke="#253b36" strokeWidth="3" />
    <path d="M88 58H380" stroke="#253b36" strokeWidth="3" />
    <circle cx="105" cy="44" r="4" fill="#cf775c" /><circle cx="119" cy="44" r="4" fill="#dbb864" /><circle cx="133" cy="44" r="4" fill="#36836e" />
    {id.startsWith('lylink') ? <>
      <rect x="111" y="79" width="72" height="72" rx="3" fill="#b8bce9" stroke="#253b36" strokeWidth="2" />
      <path d="M149 96V133M149 101L163 97V127" fill="none" stroke="#253b36" strokeWidth="4" /><circle cx="142" cy="133" r="7" fill="#253b36" /><circle cx="157" cy="127" r="7" fill="#253b36" />
      {[0, 1, 2, 3].map(i => <rect key={i} x="204" y={84+i*18} width={i===1?142:110-i*12} height="7" fill={i===1?'#367a65':'#c3c9c0'} />)}
      {[13, 25, 37, 21, 32, 45, 23, 37, 17, 29, 42, 28, 16, 34, 21, 12].map((h,i) => <rect key={i} x={116+i*15} y={198-h} width="8" height={h} fill="#367a65" />)}
    </> : id==='tanks' || id==='platformer' ? <>
      <rect x="110" y="77" width="248" height="127" fill="#dce6c8" />
      <path d="M110 105H230V151H285V77M150 204V169H205M312 204V122H358" fill="none" stroke="#7b9566" strokeWidth="12" />
      <rect x="250" y="171" width="27" height="22" fill="#315849" /><path d="M265 181H292" stroke="#315849" strokeWidth="6" />
      <rect x="141" y="83" width="22" height="21" fill="#b96144" /><path d="M152 93V75" stroke="#b96144" strokeWidth="5" />
    </> : id==='aws-backup' ? <>
      <ellipse cx="161" cy="95" rx="35" ry="12" fill="#e7c078" stroke="#253b36" strokeWidth="3" />
      <path d="M126 95V167C126 183 196 183 196 167V95M126 120C126 136 196 136 196 120M126 145C126 161 196 161 196 145" fill="none" stroke="#253b36" strokeWidth="3" />
      <path d="M211 135H247M236 124L247 135L236 146" fill="none" stroke="#367a65" strokeWidth="4" />
      <path d="M270 153H323C345 153 348 124 328 119C330 92 291 85 281 111C258 106 249 142 270 153Z" fill="#a7cec2" stroke="#253b36" strokeWidth="3" />
      <text x="291" y="138" fill="#253b36" fontFamily="monospace" fontSize="17">S3</text>
      <text x="128" y="202" fill="#367a65" fontFamily="monospace" fontSize="12">$ scan → zip → upload</text>
    </> : id==='menu' ? <>
      <rect x="113" y="86" width="242" height="103" fill="#315849" stroke="#253b36" strokeWidth="4" />
      <rect x="130" y="100" width="208" height="58" fill="#b8cf95" />
      <text x="144" y="122" fontFamily="monospace" fontSize="15" fill="#253b36">&gt; I2C MENU</text><text x="144" y="144" fontFamily="monospace" fontSize="13" fill="#253b36">16x2 / 20x4</text>
      {[0,1,2,3].map(i=><circle key={i} cx={147+i*56} cy="175" r="4" fill="#d8ceae" />)}
    </> : id==='buffet' ? <>
      <rect x="116" y="80" width="99" height="122" fill="#f4bb82" /><path d="M136 121Q164 88 193 121Z" fill="#b96144" /><path d="M136 132H193M136 144H193" stroke="#315849" strokeWidth="7" />
      {[0,1,2,3].map(i=><rect key={i} x="234" y={86+i*21} width={i===0?99:75} height="8" fill={i===0?'#253b36':'#d0c9b8'} />)}<rect x="234" y="178" width="99" height="24" fill="#367a65" />
    </> : <>
      <rect x="111" y="80" width="246" height="121" fill="#253b36" />
      <text x="129" y="110" fill="#a7cec2" fontFamily="monospace" fontSize="17">{id==='jshort'?'https:// → /abc':id==='gamelist'?'[✓] next quest':'$ endless ideas'}</text>
      {[0,1,2].map(i=><path key={i} d={`M130 ${133+i*21}H${i===1?260:318}`} stroke={i===1?'#dabb75':'#69897c'} strokeWidth="6" />)}
    </>}
    <path d="M407 69V87M398 78H416M56 182V200M47 191H65" stroke="#253b36" strokeWidth="3" />
  </svg>;
}
