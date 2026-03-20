import logoIcon from '/icons.png';

const LogoHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-1">
      <img className="w-[50px] h-[50px]" src={logoIcon} alt="logo" />
      <div className="flex flex-col items-start justify-center mt-[-5px]">
        <h1 className="text-3xl font-bold text-netflix-red">
          Plus<b className="text-[#ff751f]">TV</b>
        </h1>
        <h6 className="text-[10px] p-0 m-0">O MELHOR APP DE IPTV</h6>
      </div>
    </div>
  );
};

export default LogoHeader;
