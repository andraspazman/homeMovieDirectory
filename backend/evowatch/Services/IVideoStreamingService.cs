namespace evoWatch.Services
{
    public interface IVideoStreamingService
    {
       
        FileStream GetVideoFileStream(string videoFileName);
    }
}
